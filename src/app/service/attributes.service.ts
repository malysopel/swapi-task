import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttributesService {
  constructor(private readonly http: HttpClient) {}

  getAttributes(
    attributesName: string,
    attributeNumber: number,
  ): Observable<any> {
    return this.http.get<any>(
      `https://www.swapi.tech/api/${attributesName}/${attributeNumber}`,
    );
  }
}
