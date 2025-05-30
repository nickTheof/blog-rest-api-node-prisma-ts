export type findManyArgsPagination = {
    skip?: number,
    take?: number
}

export type activeUsersWhere = {
    isActive?: boolean
}

export type AuthorWhere = {
    author?: {
        uuid: string
    }
}

export type postWhere = {
    post?: {
        uuid: string
    }
}