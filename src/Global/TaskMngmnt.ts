export interface IMyTasks {
  HasComments?: any;
  Id?: number;
  TaskName: string;
  ClientName?: string;
  ClientID?: number;
  Creator: IPeoplePicker;
  Backup: IPeoplePicker;
  DueDate: string;
  PriorityLevel: string | any;
  Status: string | any;
  Recurrence?: string | any;
  Created: string;
  TaskAge?: number;
  CompletedDate?: string;
  DoneFormula?: string;
  DaysOnEarly?: number;
  isRecurrence?: boolean;
  ReminderRef?: number;
  ReminderDays?: number;
  CreatedByFlow?: boolean;
  RecurParent?: string;
}

export interface IPeoplePicker {
  Id: number;
  EMail: string;
  Title: string;
}

export interface IParent {
  key: string;
  Id: number;
  ClientName?: string;
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
export interface IClient {
  Id: number;
  FirstName: string;
  LastName: string;
  CompanyName: string;
  Assistant: IPeoplePicker;
  Backup: any;
}
