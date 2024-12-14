class UserActivityService {
    constructor() {
        this.message = 'Invalid operation!';
    }

    invalidTypeError(message) {
        throw new Error(message);
    }
}

export default UserActivityService;
