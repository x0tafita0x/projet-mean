/**
 * Helper to paginate Mongoose queries
 * @param {Object} model - Mongoose Model
 * @param {Object} filter - Filter object
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {Object|string} populate - Populate options
 * @param {Object|string} sort - Sort options
 * @returns {Promise<Object>} - Paginated results
 */
exports.paginate = async (model, filter = {}, page = 1, limit = 10, populate = '', sort = { createdAt: -1 }) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate(populate),
        model.countDocuments(filter)
    ]);

    return {
        data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
    };
};
