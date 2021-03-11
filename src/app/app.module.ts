import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ClarityModule } from '@clr/angular';
import { RequestsModalComponent } from './components/requests-modal/requests-modal.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { AceModule } from 'ngx-ace-wrapper';
import { ACE_CONFIG } from 'ngx-ace-wrapper';
import { AceConfigInterface } from 'ngx-ace-wrapper';

const DEFAULT_ACE_CONFIG: AceConfigInterface = {
  fontSize: '17px'
};

@NgModule({
  declarations: [AppComponent, LoginModalComponent, HomePageComponent, RequestsModalComponent, ExplorerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ClarityModule,
    AceModule
  ],
  providers: [
    {
      provide: ACE_CONFIG,
      useValue: DEFAULT_ACE_CONFIG
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [LoginModalComponent]
})
export class AppModule {}
