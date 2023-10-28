import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { Empleado } from 'src/app/Models/employee.model';
import { BdDomestiAppService } from 'src/app/Services/bd-domesti-app.service';
import { Requests } from 'src/app/Models/requests.model';
import { DbService } from 'src/app/Services/db.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-offerts',
  templateUrl: './offerts.component.html',
  styleUrls: ['./offerts.component.css']
})
export class OffertsComponent {
  offers: Empleado[] = [];
  private id: string = '';
  private rol: string = '';

  constructor(private router: Router,
    private auth: AuthService,
    private bdDomestiAppService: BdDomestiAppService,
    private dbService: DbService
  ) { }

  ngOnInit() {
    this.info();
    this.getEmployee();
  }

  getEmployee() {
    this.bdDomestiAppService.getEmployees().subscribe(data => {
      // Get only the employees with the rol of "Empleador"
      this.offers = data.filter((employee) => {
        return employee.rol === "Empleador";
      });
    })
  }

  viewMoreInfo(offer: Empleado) {
    // Swal.fire({
    //   title: offer.name,
    //   text: 'Modal with a custom image.',
    //   imageUrl: offer.photo,
    //   imageWidth: 400,
    //   imageHeight: 400,
    //   imageAlt: 'Custom image',
    //   width: 600,
    //   padding: '3em',
    //   color: '#716add',
    //   backdrop: `rgba(0,0,123,0.4)`
    // })
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })

    swalWithBootstrapButtons.fire({
      title: 'Información de la Oferta',
      html: `
      <div class="row">
        <div class="col-md-6">
          <img src="${offer.photo}" alt="offer photo" class="img-fluid">
        </div>
        <div class="col-md-6">
          <p><strong>Nombre:</strong> ${offer.name}</p>
          <p><strong>Descripción:</strong> ${offer.others}</p>
          <p><strong>Dirección:</strong> ${offer.address}</p>
          <p><strong>Correo:</strong> ${offer.email}</p>
          <p><strong>Teléfono:</strong> ${offer.phone}</p>
          <p><strong>Estado:</strong> ${offer.status}</p>
        </div>
      </div>
      `,
      width: 600,
      padding: '3em',
      color: '#716add',
      backdrop: `rgba(0,0,0,0.4)`,
      confirmButtonText: 'Solicitar un Trabajo',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.auth.isLogged()) {
          if (offer.rol === this.rol) {
            swalWithBootstrapButtons.fire(
              'No puedes solicitar un trabajo',
              'No puedes solicitar un trabajo a un empleador con el mismo rol que tú.',
              'warning'
            )
          } else if (offer.status === 'Ocupado') {
            swalWithBootstrapButtons.fire(
              'No puedes solicitar un trabajo',
              'No se puede solicitar un trabajo a un empleador que está ocupado.',
              'warning'
            )
          }
          else {
            swalWithBootstrapButtons.fire(
              'Tu solicitud ha sido enviada',
              'Su solicitud ha sido enviada, nos comunicaremos con usted pronto.',
              'success'
            )
            this.sentRequest(offer);
          }
        } else {
          swalWithBootstrapButtons.fire(
            'Usted debe estar conectado',
            'Por favor inicia sesión para solicitar un trabajo',
            'error'
          )
        }
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    })
  }

  info() {
    if (this.auth.isLogged()) {
      this.auth.searchUser().subscribe(data => {
        this.id = data[0].id!;
        this.rol = data[0].rol;
      });
    }
  }

  sentRequest(offer: Empleado) {
    const id = this.id;
    const request: Requests = {
      idApplicant: id,
      idOffer: offer.id,
      state: 'Pendiente',
      date: this.transformDate(new Date()),
      isAccepted: false
    }
    this.dbService.save(request, 'requests').then(() => {
      console.log('Solicitud Enviada');
    }).catch(error => {
      console.log(error);
    })
  }

  transformDate(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${day}/${month}/${year} ${hour}:${minutes}:${seconds}`;
  }
}