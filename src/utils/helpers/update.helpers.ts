import {PostUpdateSchema} from "../../types/zod-schemas.types";

type MappedUpdateData = {
    title?: string,
    description?: string,
    published?: boolean,
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

    if (data.published !== undefined) {
        updateData.published = data.published;
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