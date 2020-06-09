let _buff = null;
export const MaxUniqueId32 = Math.pow(2, 31) - 1;

export const uniqueId = function() {
    // init buffer with timestamp
    if (!_buff) {
        _buff = (new Date()).valueOf();
    }
    _buff++;
    return _buff.toString();
}

export const uniqueId32 = function () {
    return uniqueId() % MaxUniqueId32;
}