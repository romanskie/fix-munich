import { Injectable } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';
import { User } from '../models/user';
import { auth } from 'firebase/app';
import { create } from 'domain';


@Injectable()
export class AuthService {
    previousUrl = null;
    user: Observable<User>;
    constructor(private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router) {

        this.router.events
            .filter(e => e instanceof RoutesRecognized)
            .pairwise()
            .subscribe((event: any[]) => {
                this.previousUrl = event[0].urlAfterRedirects;
            });

        //// Get auth data, then get firestore user document || null
        this.user = this.afAuth.authState
            .switchMap(user => {
                if (user) {
                    return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
                } else {
                    return Observable.of(null)
                }
            })
    }

    googleLogin() {
        const provider = new firebase.auth.GoogleAuthProvider()
        return this.oAuthLogin(provider);
    }


    emailLogin(email: string, password: string) {
        return this.afAuth.auth.signInWithEmailAndPassword(email, password)
            .then((user) => {
                this.updateUserData(user);
                this.router.navigateByUrl('/'); 
            })
            .catch(error => console.log(error));
    }

    emailRegistration(email: string, password: string, nickname?: string, photoURL?: string) {
        return firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((credential) => {
                let user = {
                    uid: credential.uid,
                    email: credential.email,
                    displayName: null,
                    photoURL: null,
                    role: {
                        isAdmin: false,
                        isReader: true
                    }
                } as User

                if (nickname !== '' && nickname !== undefined && nickname !== null) {
                    user.displayName = nickname
                }

                if (photoURL !== '' && photoURL !== undefined && photoURL !== null) {
                    user.photoURL = photoURL
                }

                this.updateUserData(user)
            })
            .then(() => {
                this.emailLogin(email, password)
            })
            .then(() => {
                this.router.navigateByUrl('/start/overview');
            })
            .catch((error) => {
                console.error(error);
            })
    }

    private oAuthLogin(provider) {
        return this.afAuth.auth.signInWithPopup(provider)
            .then((credential) => {
                this.updateUserData(credential.user)
            })
            .then(() => {
                this.router.navigateByUrl('/start/overview');
            })
            .catch((error) => {
                console.error(error);
            })
    }

    private updateUserData(user) {
        // Sets user data to firestore on login
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
        const data: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: {
                isAdmin: user.role ? user.role.isAdmin : false,
                isReader: user.role ? user.role.isReader : true
            }
        }
        
        userRef.valueChanges().subscribe(user => {
            if(!user) return userRef.set(data);
            if(!user.role){
                userRef.update(data);
            }
        })
    }

    signOut() {
        this.afAuth.auth.signOut().then(() => {
            this.router.navigate(['/']);
        });
    }
}
