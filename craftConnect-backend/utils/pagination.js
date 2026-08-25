export const getPagination = (quesry) => {
    const page = parseInt(Query.page) || 1;
    const limit = parseInt(Query.limit) || 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};
