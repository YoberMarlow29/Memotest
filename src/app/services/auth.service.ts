import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private authFirebase : Auth,private auth:AngularFireAuth) { }

  login(email : string, password: string){

    return signInWithEmailAndPassword(this.authFirebase,email,password)
  }
  logout() {
    return this.authFirebase.signOut();
  }

  getCurrent() {
    return this.auth.currentUser;
  }

}
