import { Pipe, PipeTransform } from '@angular/core';

// Lets a table column receive the pipes it needs as data and still run them in
// the template. It only forwards static values, so async pipes are not supported.
@Pipe({ name: 'dynamic' })
export class DynamicPipe implements PipeTransform {
  transform(value: unknown, pipes: PipeTransform | PipeTransform[] | null | undefined): unknown {
    if (!pipes) {
      return value;
    }

    const chain = Array.isArray(pipes) ? pipes : [pipes];

    return chain.reduce<unknown>((current, pipe) => pipe.transform(current), value);
  }
}
