import React, { Component } from 'react';
import { Vacation } from '../../models/vacation';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import "./notFollowed.css";
interface FollowedProps {
    vacations: Vacation[];
    toggleFollow: Function;
    cityName: Function;
    showDates: Function;
}
export class NotFollowed extends Component<FollowedProps> {
    render(): JSX.Element {
        return (
            <div className="notFollowed" style={{display: (this.props.vacations.length === 0)? "none": "block"}}>
                {this.props.vacations.map((v: Vacation) => {
                    const from = new Date(v.sDate);
                    const to = new Date(v.eDate);
                    const modifiers = { start: from, end: to };
                    return (<div className='card' key={v.id}>
                        <label className="edit">
                            <input type="checkbox" id={JSON.stringify(v.id)} onClick={this.props.toggleFollow.bind(this)} />
                            <i title="Toggle Follow" className="fa fa-heart"></i>
                        </label>
                        <h3>{v.destination}</h3>
                        <div className="image">
                            <img src={`http://localhost:3001/assets/vacationsImg/${this.props.cityName(v.destination)}.jpg`} alt={v.destination} />
                        </div>
                        <div className="card-content">
                            <p>Price: {v.price}$</p>
                            <p>{v.description}</p>
                        </div>
                        <label className="show-dates" onClick={this.props.showDates.bind(this)}><i className="fa fa-calendar-alt" data-value="dates"></i></label>
                        <DayPicker className="Selectable" showOutsideDays month={from} modifiers={modifiers} selectedDays={[from, { from, to }]} disabledDays={{ daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }} />
                    </div>)
                })}
            </div>
        )
    }
}
