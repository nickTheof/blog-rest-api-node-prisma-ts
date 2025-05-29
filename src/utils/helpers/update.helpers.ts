import {PostUpdateSchema} from "../../types/zod-schemas.types";
import {PostStatus} from "@prisma/client";

export type MappedUpdateData = {
    title?: string,
    description?: string,
    status?: PostStatus,
    category?: {
        set: [],
        connect: { id: number }[]
    }
}

const mapUpdatePostData = (data: PostUpdateSchema) => {
    const updateData: MappedUpdateData = {};
    if (data.title !== undefined) {
        updateData.title = data.title;
    }

    if (data.description !== undefined) {
        updateData.description = data.description;
    }

    if (data.status !== undefined) {
        updateData.status = data.status;
    }

    if (data.categories !== undefined) {
        updateData.category = {
            set: [],
            connect: data.categories.map((id) => ({ id })),
        };
    }
    return updateData;
}

export default mapUpdatePostData;