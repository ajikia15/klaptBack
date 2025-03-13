import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass, plainToInstance } from 'class-transformer';
import { UserDto } from 'src/users/dtos/user.dto';
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // console.log('I am running before the handler', context);

    return handler.handle().pipe(
      map((data: any) => {
        // console.log('I am running before responding', data);
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true, // exclude extra properties
        });
      }),
    );
  }
}
