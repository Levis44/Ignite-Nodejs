import { Request, Response } from 'express';
import CreateCourseService from './CreateCourseService';


export function createCourse(request: Request, response: Response) {
    CreateCourseService.execute({
        name: "Nodejs",
        duration: 10,
        educator: "Levi"
    });

    CreateCourseService.execute({
        name: "Elixir",
        educator: "Diego"
    });

    return response.send()
}