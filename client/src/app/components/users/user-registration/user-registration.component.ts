import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from "../../../core/auth.service";
import { FileHolder } from 'angular2-image-upload';
import { UploadedImage } from '../../../models/uploaded-image';
import { ImageUploadService } from '../../../services/imageupload.service';

@Component({
    selector: 'app-user-registration',
    templateUrl: './user-registration.component.html',
    styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit {

    registrationPassword: string = '';
    registrationEmailAddress: string = '';
    registrationNickname: string = '';
    registrationPhotoURL: string = null;
    uploadedImage: File = null;
    

    constructor(public router: Router, public auth: AuthService, private imageUploadService: ImageUploadService) { }

    ngOnInit() {}

    submitRegistration = () => {
        if(this.uploadedImage){
            this.imageUploadService.getProfileImageURLPromise('user/', this.uploadedImage)
        .then((url) => {
            this.auth.emailRegistration(this.registrationEmailAddress, this.registrationPassword, this.registrationNickname, url);
        } )
        .catch((error) => {
            console.error(error);
        })
        }else{
            this.auth.emailRegistration(this.registrationEmailAddress, this.registrationPassword, this.registrationNickname);
        }
    }

    onRemoved = (fileHolder: FileHolder) => {
        const file = fileHolder.file;
        //this.imageUploadService.deleteProfileImage('user/', file);
        //this.imageUploadService.deleteProfileImage('user/', file, 'thumb_');
        this.registrationPhotoURL = null;
    }   

    onUploadFinished = (fileHolder: FileHolder) => {
        
        const file = fileHolder.file;
        this.uploadedImage = file;
        /*
        this.imageUploadService.getProfileImageURLPromise('user/', file)
            .then((url) => {
                this.registrationPhotoURL = url; console.log(url);
            } )
            .catch((error) => {
                console.error(error);
            })
            //console.log('onUpload: registrationPhotoURL' + this.registrationPhotoURL)
            */
    }

}
