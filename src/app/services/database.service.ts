import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Estadistica } from '../model/Estadistica';
import { Observable, map } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private firestore: AngularFirestore) { }

  saveGameStats(stats: Estadistica) {
    return this.firestore.collection('estadisticas').add(stats);
  }
  getAllStats(): Observable<Estadistica[]> {
    return this.firestore.collection<Estadistica>('estadisticas')
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Estadistica;
          if (data.fecha instanceof Timestamp) {
            data.fecha = data.fecha.toDate(); // Convertir timestamp a Date
          }
          return data;
        }))
      );
  }

}
