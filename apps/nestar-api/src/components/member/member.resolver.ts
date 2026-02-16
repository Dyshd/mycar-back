import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Message } from '../../libs/enums/common.enum';

// ✅ configdan keraklilar
import {
    validMimeTypes,
    getSerialForImage,
    shapeIntoMongoObjectId,

    // ✅ mana bular siz configga qo‘shgan helperlar:
    isAllowedUploadTarget,
    buildUploadDiskPath,
    ensureDir,
} from '../../libs/config';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) { }

    @Mutation(() => Member)
    public async signup(@Args('input') input: MemberInput): Promise<Member> {
        console.log('MUTATION SIGNUP');
        return await this.memberService.signup(input);
    }

    @Mutation(() => Member)
    public async login(@Args('input') input: LoginInput): Promise<Member> {
        console.log('MUTATION LOGIN');
        return await this.memberService.login(input);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async checkAuth(@AuthMember('memberNick') memberNick: ObjectId): Promise<string> {
        console.log('Query :checkAuth');
        console.log('memberNick', memberNick);
        return `Hi ${memberNick}`;
    }

    @Roles(MemberType.USER, MemberType.DEALER)
    @UseGuards(RolesGuard)
    @Mutation(() => String)
    public async checkAuthRolse(@AuthMember() authMember: Member): Promise<string> {
        console.log('Query :checkAuthRolse');
        return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
        @Args('input') input: MemberUpdate,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Member> {
        console.log('MUTATION updateMember');
        delete input._id;
        return await this.memberService.updateMember(memberId, input);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Member)
    public async getMember(@Args('memberId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
        console.log('Query getMember');
        const targetId = shapeIntoMongoObjectId(input);
        return await this.memberService.getMember(memberId, targetId);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Members)
    public async getAgents(
        @Args('input') input: AgentsInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Members> {
        console.log('Query getAgents');
        return await this.memberService.getAgents(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async likeTargetMember(
        @Args('memberId') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Member> {
        console.log('Mutation: likeTargetMember');
        const likeRefId = shapeIntoMongoObjectId(input);
        return await this.memberService.likeTargetMember(memberId, likeRefId);
    }

    /** ADMIN **/
    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query(() => Members)
    public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
        console.log('Query getAllMembersByAdmin');
        return await this.memberService.getAllMembersByAdmin(input);
    }

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Member)
    public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
        console.log('Mutation: updateMemberByAdmin');
        return await this.memberService.updateMemberByAdmin(input);
    }

    // =========================
    // ✅ UPLOADER (FIXED)
    // =========================

    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async imageUploader(
        @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload,
        @Args('target') target: string,
    ): Promise<string> {
        console.log('Mutation: imageUploader');

        if (!file) throw new Error(Message.UPLOAD_FAILED);

        const { createReadStream, filename, mimetype } = file;

        if (!filename) throw new Error(Message.UPLOAD_FAILED);

        // ✅ target whitelist
        if (!isAllowedUploadTarget(target)) {
            throw new Error('Invalid upload target');
        }

        // ✅ mimetype check
        const validMime = (validMimeTypes as unknown as string[]).includes(mimetype);
        if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

        const imageName = getSerialForImage(filename);

        // ✅ abs (disk), rel (graphql return)
        const { rel, abs } = buildUploadDiskPath(target, imageName);
        ensureDir(abs);

        try {
            await pipeline(createReadStream(), createWriteStream(abs));
        } catch (err: any) {
            console.log('UPLOAD ERROR (single):', err?.message);
            throw new Error(Message.UPLOAD_FAILED);
        }

        // ✅ "uploads/member/uuid.jpg"
        return rel;
    }

    @UseGuards(AuthGuard)
    @Mutation(() => [String])
    public async imagesUploader(
        @Args('files', { type: () => [GraphQLUpload] }) files: Promise<FileUpload>[],
        @Args('target') target: string,
    ): Promise<string[]> {
        console.log('Mutation: imagesUploader');

        if (!files?.length) throw new Error(Message.UPLOAD_FAILED);

        // ✅ max 5 ta (siz aytgansiz)
        if (files.length > 5) throw new Error('Cannot upload more than 5 images');

        // ✅ target whitelist
        if (!isAllowedUploadTarget(target)) {
            throw new Error('Invalid upload target');
        }

        const results = await Promise.all(
            files.map(async (filePromise) => {
                const file = await filePromise;
                const { createReadStream, filename, mimetype } = file;

                if (!filename) throw new Error(Message.UPLOAD_FAILED);

                const validMime = (validMimeTypes as unknown as string[]).includes(mimetype);
                if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

                const imageName = getSerialForImage(filename);
                const { rel, abs } = buildUploadDiskPath(target, imageName);

                ensureDir(abs);

                try {
                    await pipeline(createReadStream(), createWriteStream(abs));
                } catch (err: any) {
                    console.log('UPLOAD ERROR (multi):', err?.message);
                    throw new Error(Message.UPLOAD_FAILED);
                }

                return rel; // ✅ "uploads/property/uuid.jpg"
            }),
        );

        return results;
    }
}
