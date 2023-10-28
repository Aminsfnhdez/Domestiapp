import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { Empleado } from 'src/app/Models/employee.model';
import { BdDomestiAppService } from 'src/app/Services/bd-domesti-app.service';
import { DbService } from 'src/app/Services/db.service';
import { Requests } from 'src/app/Models/requests.model';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent {

  profiles: Empleado[] = [];
  private id: string = '';
  private rol: string = '';

  constructor(private router: Router,
    private auth: AuthService,
    private dbService: DbService,
    private bdDomestiAppService: BdDomestiAppService) { }

  ngOnInit() {
    this.info();
    this.getEmployee();
  }

  getEmployee() {
    this.bdDomestiAppService.getEmployees().subscribe(data => {
      // Get only the employees with the rol of "Empleado"
      this.profiles = data.filter((employee) => {
        return employee.rol === "Empleado" && employee.id !== this.id;
      });
    })
  }

  viewMoreInfo(profile: Empleado) {
    // Swal.fire({
    //   title: profile.name,
    //   text: 'Modal with a custom image.',
    //   imageUrl: profile.photo,
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
      title: 'Información del Perfil',
      html: `
      <div class="row">
        <div class="col-md-6">
          <img src="${profile.photo}" alt="profile photo" class="img-fluid">
        </div>
        <div class="col-md-6">
          <p><strong>Nombre:</strong> ${profile.name}</p>

          <p><strong>Experiencia:</strong> ${profile.experience}</p>
          <p><strong>Descripción:</strong> ${profile.others}</p>
          <p><strong>Disponibilidad:</strong> ${profile.status}</p>
          <p><strong>Correo:</strong> ${profile.email}</p>
          <p><strong>Teléfono:</strong> ${profile.phone}</p>
        </div>
      </div>
      `,
      width: 600,
      padding: '3em',
      color: '#716add',
      backdrop: `rgba(0,0,0,0.4)`,
      confirmButtonText: 'Solicitar Servicio',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.auth.isLogged()) {
          if (profile.rol === this.rol) {
            swalWithBootstrapButtons.fire(
              'No puedes solicitar un servicio.',
              'No puedes solicitar un servicio a un empleado con el mismo rol que tú.',
              'warning'
            )
          } else if (profile.status === 'Ocupado') {
            swalWithBootstrapButtons.fire(
              'No puedes solicitar un servicio.',
              'No se puede solicitar un servicio a un empleado que está ocupado.',
              'warning'
            )
          } else {
            swalWithBootstrapButtons.fire(
              'Solicitud enviada',
              'Su solicitud ha sido enviada, nos comunicaremos con usted pronto.',
              'success'
            )
            this.sentRequest(profile);
          }
        } else {
          swalWithBootstrapButtons.fire(
            'Necesitas iniciar sesión',
            'Debe iniciar sesión para solicitar un servicio.',
            'warning'
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
      console.log('Solicitud enviada');
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
