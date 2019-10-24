import React, { Component } from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import axios from 'axios';
import "./addVacation.css";
import ImageUploader from 'react-images-upload';
import { Vacation } from '../../models/vacation';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
interface AddVacationState {
    vacation: Vacation;
    images: any[];
    modifiers: {
        from: any;
        to: any;
    };
    isImage: boolean
}
interface AddVacationProps {
    cityName: Function;
    vacationsNames: any[];
    socket: any;
    toggleElements: Function;
    escapeSqlChars: Function;
}
export class AddVacation extends Component<AddVacationProps, AddVacationState> {
    public constructor(props: any) {
        super(props);
        this.state = {
            vacation: new Vacation(),
            images: [],
            modifiers: {
                from: undefined,
                to: undefined,
            },
            isImage: false
        }
    }
    // Setting New Vacation
    private setDestination = (e: any): void => {
        const vacation = { ...this.state.vacation };
        vacation.destination = this.props.escapeSqlChars(e.target.value);
        this.setState({ vacation });
    }
    private setDescription = (e: any): void => {
        const vacation = { ...this.state.vacation };
        vacation.description = this.props.escapeSqlChars(e.target.value);
        this.setState({ vacation });
    }
    private setPrice = (e: any): void => {
        const vacation = { ...this.state.vacation };
        vacation.price = e.target.value;
        this.setState({ vacation });
    }
    private onDrop = (image: any): void => {
        const images = this.state.images;
        images.push(image);
        this.setState({ images });
    }
    // Handling Date Picker
    private handleDayClick = (day: any): void => {
        const range = DateUtils.addDayToRange(day, this.state.modifiers);
        const vacation = { ...this.state.vacation };
        vacation.sDate = range.from;
        vacation.eDate = range.to;
        this.setState({ modifiers: range, vacation });
    }
    private handleReset = (): void => {
        const modifiers = { ...this.state.modifiers };
        modifiers.from = undefined;
        modifiers.to = undefined;
        this.setState({ modifiers });
    }
    // Option To Dismiss Image Uploader
    private isImage = (e: any) => {
        if (e.target) {
            if (e.target.checked) {
                e.target.parentElement.children[1].style.color = "#27ae60";
                this.setState({ isImage: !this.state.isImage });
            }
            else {
                e.target.parentElement.children[1].style.color = "#c0392b";
                this.setState({ isImage: !this.state.isImage });
            }
        }
        else {
            if (e.checked) {
                e.parentElement.children[1].style.color = "#27ae60";
                this.setState({ isImage: !this.state.isImage });
            }
            else {
                e.parentElement.children[1].style.color = "#c0392b";
                this.setState({ isImage: !this.state.isImage });
            }
        }
    }
    // Disabling Submit
    private isFormLegal(): boolean {
        return this.state.vacation.destination.length >= 6 &&
            this.state.vacation.destination.length <= 50 &&
            this.state.vacation.description.length <= 5000 &&
            this.state.vacation.description.length >= 30 &&
            this.state.vacation.price.length <= 10 &&
            this.state.vacation.price.length > 2 &&
            this.state.modifiers.from !== undefined &&
            this.state.modifiers.to !== undefined &&
            (this.state.images.length > 0 || this.state.isImage === true);
    }
    // Sending New Vacation To Server
    private createVacation = (e: any): void => {
        e.preventDefault();
        this.props.toggleElements(e);
        if (this.state.isImage === false) {
            const image = this.state.images[0][0];
            let formData = new FormData();
            formData.append('image', image);
            formData.append('name', this.props.cityName(this.state.vacation.destination));
            if (this.props.vacationsNames.includes(this.props.cityName(this.state.vacation.destination))) {
                if (window.confirm("You already have an image for the current destination, would you like to update it?")) {
                    axios({
                        url: "http://localhost:3001/upload-image",
                        method: "POST",
                        data: formData
                    })
                        .catch((err) => {
                            console.log(err);
                        })
                }
            }
            else {
                axios({
                    url: "http://localhost:3001/upload-image",
                    method: "POST",
                    data: formData
                })
                    .catch((err) => {
                        console.log(err);
                    })
            }
        }
        this.props.socket.emit("add-vacation", this.state.vacation);
        setTimeout(() => {
            const div = document.getElementsByClassName("addVacation show")[0];
            div.classList.remove("show");
            div.children[0].classList.remove("show");
        }, 100);
    }
    // Master Function For Toggling And Emptying
    private toggleAndEmpty(e: any): void {
        this.emptyForm(e);
        this.props.toggleElements(e);
    }
    // Emptying The Form
    private emptyForm(e: any): void {
        if (e.target.classList.value === "addVacation show") {
            const input = e.target.children[0].children[3].children[0];
            const deleteImage = document.getElementsByClassName("deleteImage");
            setTimeout(() => {
                this.setState({ vacation: new Vacation() });
                this.handleReset();
                input.checked = false;
                this.isImage(input);
                this.setState({ images: [] });
                if (deleteImage.length > 0) {
                    ReactTestUtils.Simulate.click(deleteImage[0], { target: deleteImage[0] });
                }
            }, 600);
        }
        if (e.target.parentElement.parentElement.classList.value === "addVacation show") {
            const input = e.target.parentElement.children[3].children[0];
            const deleteImage = document.getElementsByClassName("deleteImage");
            setTimeout(() => {
                this.setState({ vacation: new Vacation() });
                this.handleReset();
                input.checked = false;
                this.isImage(input);
                this.setState({ images: [] });
                if (deleteImage.length > 0) {
                    ReactTestUtils.Simulate.click(deleteImage[0], { target: deleteImage[0] });
                }
            }, 600);
        }
    }
    public render(): JSX.Element {
        const { from, to } = this.state.modifiers;
        const modifiers = { start: from, end: to };
        return (
            <div className="addVacation" onClick={this.toggleAndEmpty.bind(this)}>
                <form>
                    <i className="fa fa-times vacation" onClick={this.toggleAndEmpty.bind(this)}></i>
                    <table>
                        <tbody>
                            <tr>
                                <td>destination</td>
                                <td><input type="text" onChange={this.setDestination} value={this.state.vacation.destination} placeholder="city, country" autoFocus pattern="[a-zA-z0-9]" title="Special Characters Are Not Allowed"/></td>
                            </tr>
                            <tr>
                                <td>description</td>
                                <td><textarea onChange={this.setDescription} value={this.state.vacation.description} placeholder="at least 100 characters and up to 5000" ></textarea></td>
                            </tr>
                            <tr>
                                <td>choose dates</td>
                                <td><DayPicker
                                    className="Selectable"
                                    showOutsideDays
                                    disabledDays={day => day < (new Date())}
                                    selectedDays={[undefined, { from, to }]}
                                    modifiers={modifiers}
                                    onDayClick={this.handleDayClick} />
                                    <i className="fas fa-calendar-times" onClick={this.handleReset}></i>
                                </td>
                            </tr>
                            <tr>
                                <td>price</td>
                                <td><input type="number" onChange={this.setPrice} value={this.state.vacation.price} /><span>$</span></td>
                            </tr>
                        </tbody>
                    </table>
                    <ImageUploader
                        name="adminImage"
                        accept="image/jpg/png"
                        withIcon={true}
                        buttonText='Choose images'
                        onChange={this.onDrop.bind(this)}
                        imgExtension={['.jpg', '.png']}
                        singleImage={true}
                        withPreview={true}
                        label="Only JPG & PNG, 16:9 Ratio is Optimal" />
                    <label>
                        <input onClick={this.isImage} type="checkbox" />
                        <i>i already have an image for this location</i>
                    </label>
                    <button disabled={!this.isFormLegal()} onClick={this.createVacation.bind(this)}>add vacation</button>
                </form>
            </div>
        )
    }
}