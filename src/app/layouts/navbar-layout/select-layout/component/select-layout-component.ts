import { Component, OnInit } from '@angular/core';

@Component({
    selector:'app-select-layout',
    templateUrl: './select-layout-component.html',
    styleUrls: ['./select-layout-component.scss']
})

export class SelectLayoutComponent implements OnInit{
    selectedAirpod: string='';
    places:any[]=[
        {
            name:'Nsimalen',
            id:7
        },
        {
            name:'Bamenda',
            id:1
        },
        {
            name:'Bertoua',
            id:2
        },
        {
            name:'Douala',
            id:3
        },
        {
            name:'Garoua',
            id:4
        },
        {
            name:'Maroua-Salak',
            id:5
        },
        {
            name:'Ngaoudéré',
            id:6
        }
    ];
    ngOnInit(): void {
        console.log('krkrk');
    }

    setPlace(event: any){
        console.log(event.target.value);
        // this.translateService.setDefaultLang(event.target.value);
    }
}