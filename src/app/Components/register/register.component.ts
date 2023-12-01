import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Empleado } from 'src/app/Models/employee.model';
import { AuthService } from 'src/app/Services/auth.service';
import { BdDomestiAppService } from 'src/app/Services/bd-domesti-app.service';
import { ImageService } from 'src/app/Services/image.service';
import { ValidationsService } from 'src/app/Services/validations.service';
import { ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  seasonSelected = 'Winter';
  isChecked = true;
  sh = 1;
  index = false;
  type = false;
  imgSrc = "../../../assets/Placeholder.svg"
  private selectedImage: any = null;

  isEdit = false;
  title = 'Registro';
  btn = 'Aceptar y Registrarse';

  employeed: Empleado = {
    name: '',
    email: '',
    password: '',
    phone: '',
    cc: '',
    expDate: '',
    address: '',
    rol: '',
    status: '',
    photo: '',
    experience: '',
    others: ''
  }

  constructor(private router: Router,
    private auth: AuthService,
    private imageService: ImageService,
    private bdDomestiAppService: BdDomestiAppService,
    private validations: ValidationsService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    if (this.getId() != null) {
      this.isEdit = true;
    }
    this.changeData();
  }

  changeData() {
    if (this.isEdit) {
      this.title = 'Configuración de Perfil';
      this.btn = 'Guardar';
      this.type = true;
      this.auth.searchUser().subscribe((data) => {
        this.employeed = data[0];
        this.imgSrc = this.employeed.photo!;
        this.selectedImage = this.employeed.photo;
        this.isChecked = (this.employeed.rol == 'Empleado') ? true : false;
        this.sh = (this.employeed.rol == 'Empleado') ? 1 : 0;
      });
    }
  }

  getId() {
    return this.activatedRoute.snapshot.paramMap.get('id');
  }

  login() {
    this.router.navigate(['sign-in']);
  }

  submit() {
    this.employeed.email = this.employeed.email.toLowerCase();
    this.employeed.status = 'Libre';
    this.employeed.rol = ((this.sh == 1) ? 'Empleado' : 'Empleador');
    if (this.validations.validateAll(this.employeed)) {
      if (this.type) {
        if (this.isEdit && this.imgSrc != this.employeed.photo) {
          this.saveImage();
        } else {
          this.saveEmployee();
        }
      } else {
        this.saveImage();
      }
    } else {
      window.alert('Fill all the fields');
    }
  }

  saveImage() {
    var filePath = `${((this.sh == 1) ? 'Empleados' : 'Empleadores')}/${this.employeed.name + this.employeed.cc}/${this.selectedImage}-${new Date().getTime()}`;
    const fileRef = this.imageService.getRef(filePath);

    this.imageService.uploadImage(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          this.index = true;
          this.employeed.photo = url;
          this.saveEmployee();
        });
      })
    ).subscribe();
  }

  register() {
    this.auth.signUp(this.employeed).then(async () => {
      const response = await this.bdDomestiAppService.saveEmployee(this.employeed);
      console.log(response);
      if (response) {
        this.employeed.id = response.id;
        this.bdDomestiAppService.updateEmployee(this.employeed).then(() => {

          Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'Bienvenido a DomestiApp',
            showConfirmButton: false,
            timer: 1500
          })
          this.auth.signOut();
          this.router.navigate(['/sign-in']);
          window.location.reload();
        })
      }
    }).catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El usuario ya existe',
        showConfirmButton: false,
        timer: 1500
      })
    });
  }

  async saveEmployee() {
    if (this.isEdit) {
      this.auth.changePassword(this.employeed.password);
      this.bdDomestiAppService.updateEmployee(this.employeed).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Actualización exitosa',
          text: 'Se ha actualizado tu perfil',
          showConfirmButton: false,
          timer: 1500
        })
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se ha podido actualizar tu perfil',
          showConfirmButton: false,
          timer: 1500
        })
      });

    } else {
      this.register();
    }
  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    } else {
      this.imgSrc = '';
      this.selectedImage = null;
    }
  }

  resetForm() {
    this.imgSrc = "../../../assets/Placeholder.svg";
    this.selectedImage = null;
    this.index = false;
    this.employeed.name = '';
    this.employeed.email = '';
    this.employeed.password = '';
    this.employeed.phone = '';
    this.employeed.cc = '';
    this.employeed.expDate = '';
    this.employeed.address = '';
    this.employeed.rol = '';
    this.employeed.status = '';
    this.employeed.photo = '';
    this.employeed.experience = '';
    this.employeed.others = '';
  }

  isEmpty(str: string) {
    return this.validations.isEmpty(str);
  }


  validates(index: number) {
    switch (index) {
      case 0:
        return this.validations.validateName(this.employeed.name);
      case 1:
        return this.validations.validateEmail(this.employeed.email);
      case 2:
        return this.validations.validatePassword(this.employeed.password);
      case 3:
        return this.validations.validatePhone(this.employeed.phone);
      case 4:
        return this.validations.validateCC(this.employeed.cc);
      default:
        return false;
    }
  }
}
