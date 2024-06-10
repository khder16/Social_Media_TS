import { User } from '../src/types.ts'
declare global {
    namespace Express {
        export interface Request {
            userId?: string,
            user?: User,
            files: string
        }
    }
}