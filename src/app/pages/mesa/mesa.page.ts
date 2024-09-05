import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonLabel, IonTabButton, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from "sweetalert2";
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { Estadistica } from 'src/app/model/Estadistica';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.page.html',
  styleUrls: ['./mesa.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonButton, IonTabButton, IonLabel, IonContent,
    IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class MesaPage implements OnInit, OnDestroy {
  cards = [];
  selectedCards = [];
  images = [];
  level = 'easy'; // Nivel predeterminado
  timer: any;
  millisecondsElapsed: number = 0;

  isSaving: boolean = false; // Variable para controlar la visibilidad del spinner

  // Arrays de imágenes por nivel
  easyImages = [
    'assets/animales/gato.png',
    'assets/animales/perro.png',
    'assets/animales/mono.png'
  ];

  mediumImages = [
    'assets/herramientas/martillo.png',
    'assets/herramientas/cooter.png',
    'assets/herramientas/destornillador.png',
    'assets/herramientas/pinza.png',
    'assets/herramientas/cerrucho.png'
  ];

  hardImages = [
    'assets/frutas/calabaza.png',
    'assets/frutas/cerezas.png',
    'assets/frutas/mango.png',
    'assets/frutas/manzana.png',
    'assets/frutas/pina.png',
    'assets/frutas/platano.png',
    'assets/frutas/sandia.png',
    'assets/frutas/uvas.png'
  ];

  constructor(private route: ActivatedRoute, private router: Router, private db: DatabaseService, private auth: AuthService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.level = params['level'];
      this.initGame();
      this.startTimer();
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer); // Limpiar el temporizador cuando se destruye el componente
  }

  initGame() {
    this.cards = [];
    this.millisecondsElapsed = 0; // Reiniciar el contador de tiempo
    // Asignar imágenes según el nivel seleccionado
    if (this.level === 'easy') {
      this.images = this.easyImages;
    } else if (this.level === 'medium') {
      this.images = this.mediumImages;
    } else if (this.level === 'hard') {
      this.images = this.hardImages;
    }

    // Duplicar las imágenes y mezclarlas
    const shuffledImages = [...this.images, ...this.images].sort(() => 0.5 - Math.random());
    // Crear cartas con las imágenes mezcladas
    shuffledImages.forEach(image => {
      this.cards.push({ image, isFlipped: false, isMatched: false, isMatchedIncorrect: false });
    });
  }

  selectCard(index: number) {
    // Evitar que se seleccione una carta volteada o ya emparejada
    if (this.cards[index].isFlipped || this.cards[index].isMatched) {
      return;
    }

    // Voltear carta seleccionada
    this.cards[index].isFlipped = true;
    this.selectedCards.push(index);

    // Verificar si hay dos cartas seleccionadas para comprobar si son iguales
    if (this.selectedCards.length === 2) {
      this.checkForMatch();
    }
  }

  checkForMatch() {
    const [index1, index2] = this.selectedCards;
    // Comparar las imágenes de las cartas seleccionadas
    if (this.cards[index1].image === this.cards[index2].image) {
      // Si las imágenes son iguales, marcar las cartas como emparejadas
      this.cards[index1].isMatched = true;
      this.cards[index2].isMatched = true;
      this.checkIfGameEnded();
    } else {
      // Si las imágenes son diferentes, marcar como incorrectas y voltear las cartas nuevamente después de un tiempo
      this.cards[index1].isMatchedIncorrect = true;
      this.cards[index2].isMatchedIncorrect = true;
      setTimeout(() => {
        this.cards[index1].isFlipped = false;
        this.cards[index2].isFlipped = false;
        this.cards[index1].isMatchedIncorrect = false;
        this.cards[index2].isMatchedIncorrect = false;
      }, 1000);
    }
    // Limpiar el array de cartas seleccionadas
    this.selectedCards = [];
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.millisecondsElapsed += 10; // Incrementar en 10 milisegundos
    }, 10);
  }

  async checkIfGameEnded() {
    const allMatched = this.cards.every(card => card.isMatched);
    if (allMatched) {
      clearInterval(this.timer); // Detener el cronómetro
      this.isSaving = true; // Mostrar el spinner
      const email = (await this.auth.getCurrent())?.email; // Obtener el email del usuario
      const estadistica: Estadistica = {
        modo: this.level,
        email: email || 'desconocido',
        timer: this.millisecondsElapsed,
        fecha: new Date()
      };
      this.db.saveGameStats(estadistica).then(() => {
        this.isSaving = false; // Ocultar el spinner
        Swal.fire({
          title: 'PARTIDA FINALIZADA',
          text: `Tu tiempo fue de ${this.formatTime(this.millisecondsElapsed)}`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Jugar de nuevo',
          cancelButtonText: 'Volver al inicio',
          heightAuto: false
        }).then(result => {
          if (result.isConfirmed) {
            this.initGame();
            this.startTimer();
          } else {
            this.goHome();
          }
        });
      }).catch(error => {
        this.isSaving = false; // Ocultar el spinner en caso de error
        console.error('Error guardando estadística:', error);
      });
    }
  }


  formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    return `${seconds}.${ms < 100 ? '0' : ''}${ms < 10 ? '0' : ''}${ms} s`;
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
