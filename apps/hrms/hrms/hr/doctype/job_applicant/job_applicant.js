// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

// For license information, please see license.txt

// for communication
cur_frm.email_field = "email_id";

frappe.ui.form.on("Job Applicant", {
	refresh: function(frm) {
		frm.set_query("job_title", function() {
			return {
				filters: {
					'status': 'Open'
				}
			};
		});
		frm.events.create_custom_buttons(frm);
		frm.events.make_dashboard(frm);
			frm.add_custom_button('click me',()=>{

				frappe.call({
					method: 'frappe.core.api.file.tablestructure',
					args: {
						name: '`tabJob Applicant`'
					},
				
					callback: (r) => {
						console.log("doctype" + r)
						
						// on success
					},
					error: (r) => {
						console.log("---------------------------------")
						console.log(frm.doc.applicant_name)
						console.log("---------------------------------")
						
					}
				})
				//-------------------------------
		
				frappe.call({
					method: 'frappe.core.api.file.printtable',
					args: {
						name: 'Job Applicant'
					},
				
					callback: (r) => {
						console.log(r['message'][0])
						
						// on success
					},
					error: (r) => {
						console.log("---------------------------------")
						console.log(frm.doc.applicant_name)
						console.log("---------------------------------")
						
					}
				})
				//------------------------------
				
			try{
			fetch('https://reqres.in/api/users?page=3&resume_link='+frm.doc.applicant_name,
			{
				method: "GET",
				
			}
		)
		.then(function(response) {
		
			return response.json();
		
		}).then(function(myJson) { 
			frappe.show_alert("applicant name is " + frm.doc.applicant_name + ' page no is ' +myJson["page"])
			
		  console.log(myJson); 
		  console.log("my page")
		  console.log(myJson["page"])
		  console.log(myJson["data"].length)
		  console.log(myJson["support"]["text"])

		  if(myJson["data"].length ==0){
			console.log("data console")
		    throw { message : "data array length is 0"}; 
		  }
			if(myJson["support"]["text"] =="To keep ReqRes free, contributions towards server costs are appreciated!"){
            console.log("this is the right place")
			throw { message : "text is matching"}; 

			}
		})
	}
			catch{

            console.log("error caught")

			}		
				

			
			})
			
			
		
		
	},

	create_custom_buttons: function(frm) {
		if (!frm.doc.__islocal && frm.doc.status !== "Rejected" && frm.doc.status !== "Accepted") {
			frm.add_custom_button(__("Interview"), function() {
				frm.events.create_dialog(frm);
			}, __("Create"));

			// frm.add_custom_button(__(), function() {
			//   frappe.show_alert("make payment ")          
            // frappe.msgprint(__('please follow the link to make payment <a href ="www.articles.com">www.articles.com</a>'))        
            //    window.open('https://outlook.office365.com/mail/')
			// }, __("Custom Button"));
		}

		if (!frm.doc.__islocal) {
			if (frm.doc.__onload && frm.doc.__onload.job_offer) {
				$('[data-doctype="Employee Onboarding"]').find("button").show();
				$('[data-doctype="Job Offer"]').find("button").hide();
				frm.add_custom_button(__("Job Offer"), function() {
					frappe.set_route("Form", "Job Offer", frm.doc.__onload.job_offer);
				}, __("View"));
			} else {
				$('[data-doctype="Employee Onboarding"]').find("button").hide();
				$('[data-doctype="Job Offer"]').find("button").show();
				frm.add_custom_button(__("Job Offer"), function() {
					frappe.route_options = {
						"job_applicant": frm.doc.name,
						"applicant_name": frm.doc.applicant_name,
						"designation": frm.doc.job_opening || frm.doc.designation,
					};
					frappe.new_doc("Job Offer");
				}, __("Create"));
			}
		}
	},

	make_dashboard: function(frm) {
		frappe.call({
			method: "hrms.hr.doctype.job_applicant.job_applicant.get_interview_details",
			args: {
				job_applicant: frm.doc.name
			},
			callback: function(r) {
				if (r.message) {
					$("div").remove(".form-dashboard-section.custom");
					frm.dashboard.add_section(
						frappe.render_template("job_applicant_dashboard", {
							data: r.message.interviews,
							number_of_stars: r.message.stars
						}),
						__("Interview Summary")
					);
				}
			}
		});
	},

	create_dialog: function(frm) {
		let d = new frappe.ui.Dialog({
			title: 'Enter Interview Round',
			fields: [
				{
					label: 'Interview Round',
					fieldname: 'interview_round',
					fieldtype: 'Link',
					options: 'Interview Round'
				},
			],
			primary_action_label: 'Create Interview',
			primary_action(values) {
				frm.events.create_interview(frm, values);
				d.hide();
			}
		});
		d.show();
	},

	create_interview: function (frm, values) {
		frappe.call({
			method: "hrms.hr.doctype.job_applicant.job_applicant.create_interview",
			args: {
				doc: frm.doc,
				interview_round: values.interview_round
			},
			callback: function (r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
			}
		});
	}
});
