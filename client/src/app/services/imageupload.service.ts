import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { ImageUpload } from '../models/imageUpload';

import { AngularFireStorage, AngularFireStorageReference } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';
import { map, filter, tap } from 'rxjs/operators';
import * as firebase from 'firebase/app'


@Injectable()
export class ImageUploadService {

  uploadURL: Observable<string>
  urls: String[];
  constructor(private db: AngularFirestore, private storage: AngularFireStorage) { }

  getImageURLPromises = (files: File[]): Promise<string>[] => {
    return files.map((file) => this.storage.upload(file.name, file).then().then((res: firebase.storage.UploadTaskSnapshot) => res.downloadURL))
  }

  getProfileImageURLPromise = (path: string, file: File): Promise<string> => {
    return this.storage.upload(path + file.name, file).then().then((res: firebase.storage.UploadTaskSnapshot) => res.downloadURL)
  }

  deleteProfileImage = (path:string, file: File, preFileName?: string) => {

    if (preFileName !== '' && preFileName !== undefined && preFileName !== null) {
      this.storage.ref(path + preFileName + file.name).delete()
    }
    else {
      this.storage.ref(path + file.name).delete()
    }

  }

}

 