import { Component, OnInit } from '@angular/core';
import { ClrFocusOnViewInitModule } from '@clr/angular';
import { SASjsConfig } from '@sasjs/adapter';
import { SasService } from '../sas.service';
import { StateService } from '../state.service';
import cloneDeep from 'lodash-es/cloneDeep'

import 'brace';
import 'brace/mode/markdown';
import 'brace/theme/monokai';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit {
  public itemsTree: DirectoryItem[] = []
  public selectedItem: DirectoryItem | null = null
  public selectedJob: string | null = null
  public selectedOriginal: string | null = null
  
  public sasjsConfig: SASjsConfig | null = null

  public treeLoading: boolean = false
  public editingJob: boolean = false
  public saveLoading: boolean = false
  public error: string | null = null

  public urlQuery: {
    path: string
    jobName: string
  } | null = null 

  constructor(
    private sasService: SasService,
    private stateService: StateService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params: any) => {
      const { path, jobName } = params

      if (path) {
        this.urlQuery = {
          path: path,
          jobName: jobName
        }
      }

      if (this.itemsTree && this.itemsTree.length > 0) {
        this.goToUrlDir()
      }
    })
  }

  ngOnInit(): void {
    this.sasjsConfig = this.sasService.getSasjsConfig()

    this.stateService.startupData.subscribe((rootDirectory: any) => {
      this.itemsTree = rootDirectory
      
      this.goToUrlDir()
    })
  }

  goToUrlDir() {
    if (this.urlQuery !== null) {
      const { path, jobName } = this.urlQuery

      this.openFolder(path, (openSuccess: boolean) => {
        let foundJob = this.itemsTree.find((item: DirectoryItem) => item.ITEMNAME === jobName)

        if (foundJob) {
          this.selectedItem = foundJob
          this.openJob()
        }
      })
    }
  }

  timesClicked: number = 0
  selectItem(item: DirectoryItem) {
    this.selectedItem = item

    if (this.timesClicked === 1) {
      if (this.selectedItem.ITEMTYPE.toLowerCase() === 'folder') this.onOpenFolderClick()
      else this.onOpenJobClick()
    }

    if (this.timesClicked === 0) {
      this.timesClicked++

      setTimeout(() => {
        this.timesClicked = 0
      }, 300)
    }
  }

  jumpToPoint(point: string) {
    if (this.editingJob === true) return
    
    let jumpToPath: string = '/'

    if (point !== '') {
      let fullPath = this.getCurrentPath()
      let pathUntilClicked = fullPath.slice(0, fullPath.indexOf(point) + 1)
      jumpToPath = pathUntilClicked.join('/')
    }
    
    this.selectedJob = null

    this.onOpenFolderClick(jumpToPath)
  }

  getCurrentPath(): string[] {
    let pathArray: string[] = ['']

    if (!(this.itemsTree && this.itemsTree.length > 0)) return pathArray

    if (this.itemsTree[0].ITEMPATH !== '/') {
      pathArray = this.itemsTree[0].ITEMPATH.split('/')
    }

    return pathArray
  }

  onOpenJobClick() {
    if (!this.selectedItem) return

    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams: {jobName: this.selectedItem.ITEMNAME},
        queryParamsHandling: 'merge'
      });
  }

  openJob() {
    this.treeLoading = true

    if (this.selectedItem === null) {
      this.treeLoading = false
      return
    }

    let folderPath = this.selectedItem.ITEMPATH
    let jobName = this.selectedItem.ITEMNAME

    let data = { INDATA: [{ folderpath: folderPath, jobname: jobName}] }

    this.sasService.request('common/getjobcontents', data).then((res: any) => {
      this.selectedJob = this.codelinesToString(res.codecontent)

      this.selectedOriginal = cloneDeep(this.selectedJob)

      this.treeLoading = false
    }, (err: any) => {
      this.treeLoading = false
      this.error = err
    })
  }

  editJob() {
    this.editingJob = true
  }

  saveEditJob() {
    this.saveLoading = true

    
    if (this.selectedItem === null || this.selectedJob === null) {
      this.saveLoading = false
      return
    }
    
    let folderPath = this.selectedItem.ITEMPATH
    let jobName = this.selectedItem.ITEMNAME

    let codeLines = this.selectedJob.split('\n').map((line: string) => {
      return {codeline: line}
    })

    let data = {
      INDATA: [{ folderpath: folderPath, jobname: jobName}],
      SOURCECODE: codeLines
    }

    this.sasService.request('edit/postjobcontents', data).then((res: any) => {
      if (typeof res.sasjsAbort !== 'undefined') {
        this.error = res.sasjsAbort[0].MSG
      } else {
        this.selectedOriginal = cloneDeep(this.selectedJob)
      }

      this.saveLoading = false
    }, (err: any) => {
      this.saveLoading = false
      this.error = err
    })
  }

  cancelEditJob() {
    this.editingJob = false
    this.selectedJob = cloneDeep(this.selectedOriginal)
  }

  exitJob() {
    if (this.selectedItem === null) return
    
    this.onOpenFolderClick(this.selectedItem.ITEMPATH)
  }

  goBack() {
    if (this.selectedJob !== null) {
      this.selectedJob = null
      this.exitJob()

      return
    }

    if (!this.itemsTree) return

    let path = this.itemsTree[0].ITEMPATH
    let tempArr = path.split('/')
    tempArr.pop()
    path = tempArr.join('/')

    if (path === '') path = '/'
    
    this.onOpenFolderClick(path)
  }

  onOpenFolderClick(pathOverride?: string) {
    let folderPath: string | null = null

    if (this.selectedItem) {
      folderPath = this.selectedItem.ITEMPATH === '/' ? 
      this.selectedItem.ITEMPATH + this.selectedItem.ITEMNAME : 
      this.selectedItem.ITEMPATH + '/' + this.selectedItem.ITEMNAME
    }

    if (pathOverride) folderPath = pathOverride

    if (!folderPath) {
      return
    }

    this.router.navigate(
      [], 
      {
        relativeTo: this.route,
        queryParams: {path: folderPath}
      });
  }

  openFolder(pathOverride?: string, callback?: any) {
    this.treeLoading = true

    let folderPath: string | null = null

    if (this.selectedItem) {
      folderPath = this.selectedItem.ITEMPATH === '/' ? 
      this.selectedItem.ITEMPATH + this.selectedItem.ITEMNAME : 
      this.selectedItem.ITEMPATH + '/' + this.selectedItem.ITEMNAME
    }

    if (pathOverride) folderPath = pathOverride

    if (!folderPath) {
      this.treeLoading = false
      return
    }

    let data = { INDATA: [{folderpath: folderPath}] }

    this.sasService.request('common/getfoldercontents', data).then((res: any) => {
      this.itemsTree = res.folders
      this.selectedItem = null

      this.treeLoading = false

      if (callback) callback(true)
    }, (err: any) => {
      this.treeLoading = false
      this.error = err

      if (callback) callback(false)
    })
  }

  codelinesToString(codelines: string[]): string {
    return codelines.map((line: any) => line.CODELINE).join('\n')
  }
}

export interface DirectoryItem {
  ITEMID: string
  ITEMNAME: string
  ITEMTYPE: string
  ITEMPATH: string
}

// if (this.selectedItem === null) {
//   if (pathOverride && jobNameOverride) {
//     folderPath = pathOverride
//     jobName = jobNameOverride
//   } else {
//     this.treeLoading = false
//     return
//   }
// } else {
//   folderPath = this.selectedItem.ITEMPATH
//   jobName = this.selectedItem.ITEMNAME
// }