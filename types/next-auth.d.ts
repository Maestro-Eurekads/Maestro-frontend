import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
 
interface LoginResponse {
  token: string;  
  jwt: string;  
  user: {
    id: string;
    username: string;
  };
}

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */

  interface Session {
    token: string;
    jwt: string;
    user: DefaultSession['user'] & LoginResponse;
  }

  type User = LoginResponse;
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    user: LoginResponse;
  }
}