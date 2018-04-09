import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './components/app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { environment } from '../environments/environment';
import { HomeComponent } from './components/home/home.component';
import { TicketsComponent } from './components/tickets/tickets.component';
import { LeafletModule, LeafletDirective } from '@asymmetrik/ngx-leaflet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ArchwizardModule } from 'ng2-archwizard';

// Routing
import { Routes, RouterModule } from '@angular/router';
import { TicketDetailsDrawerComponent } from './components/ticket-details-drawer/ticket-details-drawer.component';
import { TicketDetailsComponent } from './components/ticket-details/ticket-details.component';
import { ImageUploadModule } from 'angular2-image-upload';
import { GeoLocationService } from './services/geo-location-service.service';
import { TicketService } from './services/ticket.service';
import { ImageUploadService } from './services/imageupload.service';
import { LoadingSpinnerService } from './services/loading-spinner.service';
import { UserLoginComponent } from './components/users/user-login/user-login.component';
import { UserProfileComponent } from './components/users/user-profile/user-profile.component';
import { CoreModule } from './core/core.module';
import { AuthGuard } from './core/auth.guard';
import { UserRegistrationComponent } from './components/users/user-registration/user-registration.component';
import { AddTicketComponent } from './components/add-ticket/add-ticket.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

import { CurrentLocationFromImageUploadService } from './services/current-location-from-image-upload.service';
import { CloseAddTicketModalComponent } from './components/close-add-ticket-modal/close-add-ticket-modal.component';
import { MainMapService } from './services/main-map.service';
import { LeafletTicketSummaryMapComponent } from './components/add-ticket/leaflet-ticket-summary-map/leaflet-ticket-summary-map.component';


const routes: Routes = [
    {
        path: '',
        redirectTo: 'start/overview',
        pathMatch: 'full'
    },
    {
        path: 'start',
        redirectTo: 'start/overview',
        pathMatch: 'full'
    },
    {
        path: 'start/:id',
        component: HomeComponent,
        data: { animation: 'home' },
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: UserLoginComponent,
        data: { animation: 'login' },
    },
    {
        path: 'tickets',
        component: TicketsComponent,
        data: { animation: 'tickets' }
    },
    {
        path: 'unapprovedTickets',
        component: TicketsComponent,
        data: { animation: 'unapprovedTickets' }
    },
    {
        path: 'tickets/:id/:type',
        component: TicketDetailsComponent,
        data: { animation: 'ticketDetails' }
    },
    {
        path: 'profile',
        component: UserProfileComponent,
        data: { animation: 'profile' },
        canActivate: [AuthGuard],
    },
    {
        path: 'registration',
        component: UserRegistrationComponent,
        data: { animation: 'registration' },
    },
    {
        path: 'addTicket',
        component: AddTicketComponent,
        data: { animation: 'addTicket' },
    }
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        TicketsComponent,
        TicketDetailsDrawerComponent,
        TicketDetailsComponent,
        UserProfileComponent,
        UserLoginComponent,
        UserRegistrationComponent,
        AddTicketComponent,
        LoadingSpinnerComponent,
        LeafletTicketSummaryMapComponent,
        CloseAddTicketModalComponent,
    ],
    imports: [
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AngularFireAuthModule,
        AngularFireStorageModule,
        RouterModule.forRoot(
            routes,
            { enableTracing: false } // <-- debugging purposes only
        ),
        LeafletModule.forRoot(),
        BrowserAnimationsModule,
        NgbModule.forRoot(),
        ImageUploadModule.forRoot(),
        ArchwizardModule,
        CoreModule,
    ],
    entryComponents: [
        AddTicketComponent,
        CloseAddTicketModalComponent
    ],
    
    providers: [GeoLocationService, LeafletDirective, ImageUploadService, TicketService, AuthGuard, LoadingSpinnerService, CurrentLocationFromImageUploadService, MainMapService],
    bootstrap: [AppComponent]
})
export class AppModule { }
