import {insertCategory, insertUser, insertProfile} from "./utils/data.helper";
import {Category, PostStatus, Role, User} from "@prisma/client";
import {createPostData} from "./utils/testmockdata";
import postService from "../../service/post.service";
import prisma from "../../prisma/client";


export default async () => {
    console.log("🔄 Global test Cleaning started...");
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ Global test Cleaning Process finished. Starting global test setup...");
    console.log("🔄 Global test setup started...");
    const admin: User = await insertUser(Role.ADMIN)
    const editor: User = await insertUser(Role.EDITOR)
    const user: User = await insertUser(Role.USER)
    const inactiveUser: User = await insertUser(Role.USER, false, "1");
    const activeUserForUpdate: User = await insertUser(Role.USER, true, "2");
    const activeUserMeForUpdate: User = await insertUser(Role.USER, true, "3");
    const activeUserMeForSoftDelete: User = await insertUser(Role.USER, true, "4");
    const activeUserWithoutProfile: User = await insertUser(Role.USER, true, "5");
    const activeUserWithProfileForDelete: User = await insertUser(Role.USER, true, "6");
    await insertProfile(admin.uuid)
    await insertProfile(editor.uuid)
    await insertProfile(user.uuid)
    await insertProfile(activeUserWithProfileForDelete.uuid)
    const category1: Category = await insertCategory(1)
    const category2: Category = await insertCategory(2)
    const category3: Category = await insertCategory(3)
    const category4: Category = await insertCategory(4)
    await postService.create(admin.uuid, createPostData(PostStatus.PUBLISHED, [category1.id, category2.id]))
    await postService.create(admin.uuid, createPostData(PostStatus.DRAFT, [category2.id, category3.id]))
    await postService.create(editor.uuid, createPostData(PostStatus.PUBLISHED, [category3.id, category4.id]))
    await postService.create(editor.uuid, createPostData(PostStatus.DRAFT, [category2.id, category3.id]))
    await postService.create(user.uuid, createPostData(PostStatus.PUBLISHED, [category1.id, category2.id]))
    await postService.create(user.uuid, createPostData(PostStatus.DRAFT, [category1.id, category2.id]))
    console.log("✅ Global test data loaded.");
};