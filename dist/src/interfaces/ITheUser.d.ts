export default interface ITheUser {
    email: string;
    mongoId: string;
    message: string;
    name: string;
    program_administrator: boolean;
    administrator: number;
    firstname: string;
    jwt_token: string;
    lastname: string;
    payments: Record<string, unknown>;
    update_localstorage: boolean;
    IP: string;
    accountType: string;
    badges: any[];
    description: string;
    email_notifications: boolean;
    lti_user_id: null | string;
    ltinopwd: boolean;
    phoneNumber: null | string;
    sms_notifications: boolean;
    thumbnailUrl: string;
    university: string;
}
