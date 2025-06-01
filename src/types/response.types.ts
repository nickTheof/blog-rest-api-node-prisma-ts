import {Category, Post, Prisma, User} from "@prisma/client";

export type ProfileWithUser = Prisma.ProfileGetPayload<{
    include: {
        user: true;
    };
}>;

export type CommentWithAuthorAndPost = Prisma.CommentGetPayload<{
    include: {
        author: true,
        post: true
    }
}>;

export type CommentWithAuthor = Prisma.CommentGetPayload<{
    include: {
        author: true,
    }
}>;

export type CommentWithPost = Prisma.CommentGetPayload<{
    include: {
        post: true,
    }
}>;


export type FormattedPost = Omit<Post, 'id' | 'authorId'> & {
    id: string;
    authorId: string;
}

export type FormattedUser = Omit<User, 'id'> & {
    id: string;
}

export type FormattedProfile = Omit<ProfileWithUser, 'id' | 'userId' | 'user'> & {
    id: string;
    userId: string;
    user: FormattedUser;
}

export type FormattedCommentWithAuthorAndPost = Omit<CommentWithAuthorAndPost, 'id' | 'userId' | 'postId' | 'author' | 'post'> & {
    id: string;
    userId: string;
    postId: string;
    author: FormattedUser;
    post: FormattedPost;
}

export type FormattedCommentWithAuthor = Omit<CommentWithAuthor, 'id' | 'userId' | 'postId' | 'author' > & {
    id: string;
    userId: string;
    postId: string;
    author: FormattedUser;
}

export type FormattedCommentWithPost = Omit<CommentWithPost, 'id' | 'userId' | 'postId' | 'post' > & {
    id: string;
    userId: string;
    postId: string;
    post: FormattedPost;
}

export type FormattedEntityData = FormattedPost | FormattedUser | FormattedProfile | Category | FormattedCommentWithAuthorAndPost | FormattedCommentWithAuthor | FormattedCommentWithPost;
export type FormattedArrayEntityData = FormattedEntityData[];

export type LoginUserServiceResponse = {
    status: string;
    data?: string;
    message?: string;
}