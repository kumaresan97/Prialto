export interface IMyTasks {
  Id?: number;
  TaskName: string;
  Creator: IPeoplePicker;
  Backup: IPeoplePicker;
  DueDate: string;
  PriorityLevel: string | any;
  Status: string | any;
  Created: string;
}

export interface IPeoplePicker {
  Id: number;
  EMail: string;
  Title: string;
}

export interface IParent {
  key: string;
  Id: number;
  isParent: boolean;
  isClick: boolean;
  isEdit: boolean;
  isAdd: boolean;
  data: IMyTasks;
  children: IChild[];
}

export interface IChild {
  key: string;
  subId: number;
  isParent: boolean;
  Id: number;
  isClick: boolean;
  isEdit: boolean;
  isAdd: boolean;
  data: IMyTasks;
}
