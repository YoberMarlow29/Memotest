import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonTabButton, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import Swal from "sweetalert2";
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { logOutOutline, statsChartOutline } from 'ionicons/icons';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonIcon, IonButton, IonTabButton, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink]
})
export class HomePage implements OnDestroy {
  private statsSubscription: Subscription | null = null;
  isLoadingStats: boolean = false; // Variable para controlar la visibilidad del spinner

  constructor(private router: Router, private auth: AuthService, private db: DatabaseService) {
    addIcons({ logOutOutline, statsChartOutline });
  }

  selectLevel(level: string) {
    this.router.navigate(['/mesa', { level }]);
  }

  btnSalir() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    }).catch(error => {
      console.log('Error al cerrar sesión:', error);
    });
  }

  async btnEstadisticas() {
    const { value: level } = await Swal.fire({
      title: 'Selecciona el nivel',
      input: 'select',
      inputOptions: {
        easy: 'Nivel Fácil',
        medium: 'Nivel Medio',
        hard: 'Nivel Difícil'
      },
      inputPlaceholder: 'Selecciona un nivel',
      showCancelButton: true,
      cancelButtonText: 'Cancelar', // Texto en español para el botón de cancelar
      heightAuto: false
    });

    if (level) {
      this.isLoadingStats = true; // Mostrar el spinner
      if (this.statsSubscription) {
        this.statsSubscription.unsubscribe();
      }
      this.statsSubscription = this.db.getAllStats().subscribe({
        next: (stats) => {
          this.isLoadingStats = false; // Ocultar el spinner
          const filteredStats = stats.filter(stat => stat.modo === level);
          const sortedStats = filteredStats.sort((a, b) => a.timer - b.timer).slice(0, 5);

          let statsHtml = '<ul>';
          sortedStats.forEach(stat => {
            statsHtml += `<li>${stat.email} - ${this.formatTime(stat.timer)} - ${new Date(stat.fecha).toLocaleDateString()}</li>`;
          });
          statsHtml += '</ul>';

          let levelTitle = '';
          switch (level) {
            case 'easy':
              levelTitle = 'LOS MEJORES JUGADORES DE LA DIFICULTAD FÁCIL';
              break;
            case 'medium':
              levelTitle = 'LOS MEJORES JUGADORES DE LA DIFICULTAD MEDIA';
              break;
            case 'hard':
              levelTitle = 'LOS MEJORES JUGADORES DE LA DIFICULTAD DIFÍCIL';
              break;
          }

          Swal.fire({
            title: levelTitle,
            html: statsHtml,
            heightAuto: false
          });
        },
        error: (error) => {
          this.isLoadingStats = false; // Ocultar el spinner en caso de error
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron obtener las estadísticas',
            icon: 'error',
            heightAuto: false
          });
        }
      });
    }
  }

  formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = milliseconds % 1000;
    return `${seconds}.${ms < 100 ? '0' : ''}${ms < 10 ? '0' : ''}${ms} s`;
  }

  ngOnDestroy() {
    if (this.statsSubscription) {
      this.statsSubscription.unsubscribe();
    }
  }
}
