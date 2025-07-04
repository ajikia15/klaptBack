import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsString,
  IsOptional,
} from 'class-validator';

export class DescriptionDto {
  @IsOptional()
  @IsString()
  ka?: string;

  @IsOptional()
  @IsString()
  en?: string;

  @IsOptional()
  @IsString()
  ru?: string;
}

export function IsAtLeastOneLanguageFilled(
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAtLeastOneLanguageFilled',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false; // handle null or undefined
          const { ka, en, ru } = value as DescriptionDto;
          return !!(ka || en || ru);
        },
        defaultMessage(args: ValidationArguments) {
          return 'At least one language (ka, en, or ru) must be provided in the description.';
        },
      },
    });
  };
}
