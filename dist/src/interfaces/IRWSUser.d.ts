export default interface IRWSUser extends Object {
    email: string;
    mongoId: string;
    name: string;
    message: string;
    jwt_token: string;
}
