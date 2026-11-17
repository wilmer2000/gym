import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CsvService {
  parseCsvFile<T>(file: File, mapRow: (row: any) => T, required: string[]): Observable<T[]> {
    return new Observable((observer) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        delimiter: ',',
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields ?? [];
          const missing = required.filter((column) => !headers.includes(column));

          if (missing.length) {
            observer.error(new Error(`Faltan columnas: ${missing.join(', ')}`));
            return;
          }

          observer.next((results.data as any[]).map(mapRow));
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        },
      });
    });
  }
}
