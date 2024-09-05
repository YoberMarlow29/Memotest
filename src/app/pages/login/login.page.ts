import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput, IonText, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonIcon, IonText, IonInput, IonButton, IonLabel, IonItem, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  protected email: string = '';
  protected password: string = '';

  constructor(private router: Router, private auth: AuthService) { }

  ngOnInit() {
    this.resetForm();
  }

  ionViewWillEnter() {
    this.resetForm();
  }

  async btnLogin() {
    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.log("Error al iniciar sesión", error);

    }
  }

  btnUsuarioUno() {
    this.email = "admin@admin.com";
    this.password = "111111";
  }

  btnUsuarioDos() {
    this.email = "invitado@invitado.com";
    this.password = "222222";
  }

  btnUsuarioTres() {
    this.email = "usuario@usuario.com";
    this.password = "333333";
  }

  private resetForm() {
    this.email = '';
    this.password = '';
  }
}
