import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// *********************************************************************************************** //

import { Mensaje } from '../interface/mensaje.interface';

// *********************************************************************************************** //

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

// *********************************************************************************************** //
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor(
    private afs: AngularFirestore,
    public auth: AngularFireAuth
  ) {

    this.auth.authState.subscribe(
      user => {
        console.log('Estado del usuario :', user);

        if ( !user ) {

          return;

        }

        this.usuario.nombre = user.displayName;
        this.usuario.uid = user.uid;
    });

  }

  login( proveedor: string ): void {

    if ( proveedor === 'google' ) {

      this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

    } else {

      this.auth.signInWithPopup( new  firebase.auth.OAuthProvider('yahoo.com'));

    }

  }

  logout(): void {

    this.usuario = {};
    this.auth.signOut();
  }

  cargarMensajes(): Observable<any> {

    this.itemsCollection = this.afs.collection<Mensaje>('chats',
                                  ref => ref.orderBy('fecha', 'desc').limit(5)
                                  );

    // LOOK FOR CHANGES ON 'chats' COLLECTIONS
    return this.itemsCollection.valueChanges().pipe(

                              map(

                                 ( mensajes: Mensaje[] ) => {
                                   console.log(mensajes);

                                   this.chats = [];

                                   for (const mensaje of mensajes) {

                                    this.chats.unshift( mensaje );

                                   }

                                   return this.chats;
                                  }
                              )

                          );

  }

  agregarMensaje( texto: string ): Promise<any>{

    // TODO: PENDING uid's message

    const mensaje: Mensaje = {

      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid

    };

    return this.itemsCollection.add( mensaje );

  }

}
