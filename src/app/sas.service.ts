import { Injectable } from '@angular/core';

import SASjs from '@sasjs/adapter';
import { StateService } from './state.service';

@Injectable({
  providedIn: 'root',
})
export class SasService {
  private _sasService: any;

  constructor(private stateService: StateService) {
    const adapterSettings: string | null = JSON.parse(
      localStorage.getItem('adapterSettings') || '{}'
    )

    this._sasService = new SASjs(adapterSettings);
  }

  public fetchStartupData() {
    this.request('common/appinit', null).then((response: any) => {
      this.stateService.setStartupData(response.folders);
    });
  }

  public request(url: string, data: any, config?: any) {
    url = "services/" + url
    
    return new Promise((resolve, reject) => {
      this._sasService
        .request(url, data, config, (loginRequired: boolean) => {
          this.stateService.setIsLoggedIn(false);
        })
        .then(
          (res: any) => {
            if (res.login === false) {
              this.stateService.setIsLoggedIn(false);
              this.stateService.username.next('');
              reject(false);
            }

            if (this.stateService.username.getValue().length < 1 && res.MF_GETUSER) {
              this.stateService.username.next(res.MF_GETUSER);
            }

            if (res.status === 404) {
              reject({ MESSAGE: res.body || 'SAS responded with an error' });
            }

            resolve(res);
          },
          (err: any) => {
            reject(err);
          }
        );
    });
  }

  public async login(username: string, password: string) {
    return this._sasService
      .logIn(username, password)
      .then(
        (res: { isLoggedIn: boolean; userName: string }) => {
          this.stateService.setIsLoggedIn(res.isLoggedIn);

          this.stateService.username.next(res.userName);

          return res.isLoggedIn;
        },
        (err: any) => {
          console.error(err);
          this.stateService.setIsLoggedIn(false);
          return false;
        }
      )
      .catch((e: any) => {
        if (e === 403) {
          console.error('Invalid host');
        }
        return false;
      });
  }

  public logout() {
    this._sasService.logOut().then(() => {
      this.stateService.setIsLoggedIn(false);
      this.stateService.username.next('');
    });
  }

  public getSasjsConfig() {
    return this._sasService.getSasjsConfig();
  }

  public getSasRequests() {
    return this._sasService.getSasRequests();
  }

  public setDebugState(state: boolean) {
    this._sasService.setDebugState(state);
  }
}
