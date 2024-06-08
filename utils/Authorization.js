exports.validateAuthorization = (authorizationHeader) => {
    if (!authorizationHeader) {
    return false;
    }
    return true;
}