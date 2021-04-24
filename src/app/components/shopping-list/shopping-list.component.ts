import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ShoppingListItem } from "../../models/ShoppingListItem";
import { FormGroup } from "@angular/forms";

type Key = 'shoppingList' | 'completedList';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  item: ShoppingListItem = {
    item: '',
    amount: '',
    isCompleted: false
  };
  shoppingList: ShoppingListItem[];
  completedList: ShoppingListItem[] = [];
  invalidFeedback = '';
  editedItemIndex = -1;
  showCompleted = false;

  @ViewChild('form') form: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.shoppingList = this.getFromStorage('shoppingList');
    this.completedList = this.getFromStorage('completedList');
  }

  ngOnDestroy(): void {
    this.saveToStorage(this.shoppingList, 'shoppingList');
  }

  onSubmit(form) {
    if (form.invalid) {
      const itemControl = form.form.controls.item;
      if (itemControl.errors) this.invalidFeedback = itemControl.errors.required ?
        'Please fill in the required field' : 'Should be at least 2 characters';
      return;
    }

    if (this.editedItemIndex > -1) {
      this.shoppingList[this.editedItemIndex] = {
        ...form.form.value,
        id: this.editedItemIndex,
        isCompleted: false
      };
      console.log(this.shoppingList[this.editedItemIndex]);
      this.editedItemIndex = -1;
    } else {
      this.shoppingList.push({
        ...form.form.value,
        id: this.shoppingList.length,
        isCompleted: false
      });
    }

    form.form.reset();
    form.submitted = false;

    this.saveToStorage(this.shoppingList, 'shoppingList');

  }

  editItem(i: number) {
    this.item = { ...this.shoppingList[i] };
    this.editedItemIndex = i;
  }

  deleteItem(i: number) {
    this.spliceList(this.shoppingList, i);
    this.saveToStorage(this.shoppingList, 'shoppingList');
  }

  onComplete(i: number, input) {
    if (input.control.value) {
      this.completedList.push({
        ...this.spliceList(this.shoppingList, i),
        isCompleted: true,
        id: this.completedList.length
      });
    } else {
      this.shoppingList.push({
        ...this.spliceList(this.completedList, i),
        isCompleted: false,
        id: this.shoppingList.length
      })
    }

    this.saveToStorage(this.shoppingList, 'shoppingList');
    this.saveToStorage(this.completedList, 'completedList');
  }

  private spliceList(list: ShoppingListItem[], i: number): ShoppingListItem {
    return list.splice(i, 1)[0];
  }

  private saveToStorage(list: ShoppingListItem[], key: Key) {
    localStorage.setItem(key, JSON.stringify(list));
  }

  private getFromStorage(key: Key): ShoppingListItem[] {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

}
