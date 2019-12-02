import { AbstractControl } from '@angular/forms';

export class ConfirmPasswordValidator {
    static MatchPassword(control: AbstractControl) {
        const password = control.get('password').value;

        const confirmPassword = control.get('confirmpassword').value;

        if (password !== confirmPassword) {
            control.get('confirmpassword').setErrors({ ConfirmPassword: true });
        } else {
            return null;
        }
    }
}
