import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): {};
}

export function Serialize(dto: ClassConstructor) {
  // wrapper of decorator@
  return UseInterceptors(new SerializeInterceptor(dto));
}

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
