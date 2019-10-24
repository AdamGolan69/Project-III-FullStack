import React, { Component } from 'react';
import "./chart.css";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Vacation } from '../../models/vacation';
import { Follow } from '../../models/follow';
interface ChartProps {
    follows: Follow[];
    vacations: Vacation[];
    toggleElements: Function;
}
export class Chart extends Component<ChartProps> {
    private cityName(dest: string): any {
        const index = dest.indexOf(",");
        let city = dest.slice(0, index);
        return city.toLowerCase();
    }
    componentDidMount() {
        const bars = document.getElementsByTagName("path");
        setTimeout(() => {
            for (let i = 0; i < bars.length - 1; i++) {
                const tmpItem = bars.item(i);
                if (tmpItem !== null) {
                    tmpItem.addEventListener("click", function () {
                        const tooltip = document.getElementsByClassName("recharts-rectangle recharts-tooltip-cursor");
                        tooltip[0].innerHTML = "hello";
                    });
                }
            }
        }, 1000);
    }
    public render(): JSX.Element {
        // Purifying An Array For The Chart - Follows By Destination
        const destinationFollows = this.props.vacations.flatMap(v => {
            for (const item of this.props.vacations) {
                if (item.destination === v.destination) {
                    return {
                        dest: v.destination,
                        follows: this.props.follows.filter((f: Follow): any => f.vID === v.id).length
                    };
                }
            }
        });
        destinationFollows.forEach((item, index): any => {
            for (const prop of destinationFollows) {
                if (prop !== undefined && item !== undefined) {
                    if (prop.dest === item.dest && index !== destinationFollows.indexOf(prop)) {
                        item.follows += prop.follows;
                        destinationFollows.splice(destinationFollows.indexOf(prop), 1);
                    }
                }
            }
        });
        // Creating Chart Data
        const data = [destinationFollows.map((v): any => {
            if (v !== undefined) {
                return { name: this.cityName(v.dest), follows: v.follows }
            }
        })];

        const CustomTooltip = ({ active, payload, label }: any): any => {
            if (active) {
                return (
                    <div className="custom-tooltip" style={{ background: "white", padding: ".8em", border: ".08em solid #778ca3" }}>
                        <p className="label">{`${label}`}</p>
                        <p className="desc">Follows: {`${payload[0].value}`}</p>
                        <p className="desc">Vacations: {this.props.vacations.filter((v: any) => this.cityName(v.destination) === label).length}</p>
                    </div>
                );
            }

            return null;
        };
        return (
            <div className="chart" onClick={this.props.toggleElements.bind(this)}>
                <i className="fa fa-times endChart" onClick={this.props.toggleElements.bind(this)}></i>
                <ResponsiveContainer width="65%"
                        height="65%">
                    <BarChart 
                        data={data[0]}
                        margin={{
                            top: 5, right: 30, left: 20, bottom: 5,
                        }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="follows" fill="#45aaf2" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )
    }
}
