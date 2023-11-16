// request
export interface UserCreationParams {
   email: string;
   name: string;
   username: string;
   password: string;
}

// entity
export interface User {
   id: string;
   name: string;
   email: string;
   username: string;
}

// response
export interface UserAndCredentials {
   user: User;
   token: string;
   refresh: string;
}

export interface LoginParams {
   email: string;
   password: string;
}
