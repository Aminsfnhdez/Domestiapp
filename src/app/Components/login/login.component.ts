import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user: any = {
    email: '',
    password: ''
  }

  error: boolean = false;

  constructor(private router: Router,
    private auth: AuthService) {}
  ngOnInit() {
  }

  login() {
    this.auth.signIn(this.user.email, this.user.password).then(() => {
      console.log('Usuario logueado exitosamente!');
      this.router.navigate(['home']);
      window.location.reload();
    }).catch(() => {
      console.log("Usuario o Contraseña Incorrecta");
      this.error = true;
    });
  }

  register() {
    this.router.navigate(['sign-up']);
  }
}

