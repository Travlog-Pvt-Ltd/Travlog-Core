export const parseEsTagData = (data) => {
    const result = data.map((el) => {
        const { _source, _id, ..._ } = el;
        _source['_id'] = _id;
        return _source;
    });
    return result;
};
