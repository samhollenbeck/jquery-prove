(function() {

	//setup
	var form = $('form');
	var radio = form.find('[name="toggle"]');
	var select1 = form.find('[name="charge_descriptions"]');
	var monies = form.find('.money');
	var table = form.find('table#itemization');
	var wrapper1 = form.find('#wrapper-statement-attached');
	var wrapper2 = form.find('#wrapper-itemized-amounts');
	var regex = /^[-a-zA-Z0-9,.)( ]*$/;

	var isItemization;

	var cfg = {
		fields: {
			toggle: {
				enabled: true,
				validators: {
					proveRequired: {
						debug: true,
						message: 'Amount required.',
					}
				}
			},
			amount_owed: {
				enabled: '#summarize:checked',
				trigger: 'change', //maskMoney plugin triggers change
				validators: {
					proveRequired: {
						debug: false,
						message: 'Amount required.',
					}
				}
			},
			charge_descriptions: {
				enabled: '#summarize:checked',
				trigger: false, //demo code below triggers `validate` event
				validators:{
					proveRequired: {
						debug: false,
						message: 'Description is required.',
					},
					provePattern: {
						debug: false,
						regex: regex,
						message: 'Invalid description.'
					}
				}
			},
			dynamic1: {
				enabled:'#itemize:checked',
				validators:{
					proveRequired: {
						debug: false,
						message: 'Description is required.',
					},
					provePattern: {
						debug: false,
						regex: regex,
						message: 'Invalid description.'
					}
				}
			}
		}
	};

	var events = $('#events');
	var all = [

		// prove listens to this event
		'validate',

		// prove triggers these events
		'setup.field.prove',
		'setup.form.prove',
		'validated.field.prove',
		'validated.form.prove',
		'destroyed.field.prove',
		'destroyed.form.prove'
		].join(' ');

	form.on(all, function(event, data){
		data = data || {};
		events.prepend(eventRow(event, data));
	});

	// decorate the form
	form.on('validated.field.prove', function(event, data){
		var input = $(event.target);
		input.bootstrap(data);
	});

	form.submit(function(event){
		event.preventDefault();

		var ok = form.data('prove').validate();
		//form.trigger('validate.form.prove');

		console.log('submit', ok);
	});

	//form plugins
	form.prove(cfg); //validate

	var configTagsinput = {
		trimValue: true,
		itemText: toLowerCase,
		tagClass: tagClass
	};
	var configMoneymask = {
		allowZero: true
	};

	//tags
	//select1.on('itemAdded', revalidate);
	//select1.on('itemRemoved', revalidate);
	select1.tagsinput(configTagsinput);

	//money mask
	//monies.on('change', revalidate);
	monies.maskMoney(configMoneymask);

	//seup events
	radio.change(onRadioChange);
	table.on('change', 'input.amount', onItemizationChange);
	table.on('click', 'a.add-principle-row', addPrincipleChargeRow);
	table.on('click', 'a.add-additional-row', addAdditionalChargeRow);
	table.on('click', 'a.del-principle-row', delChargeRow);
	table.on('click', 'a.del-additional-row', delChargeRow);


	//radio wrapper
	function onRadioChange(event){
		var val = $(this).val();
		console.log('onRadioChange()', val);
		if (val === '1') {
			isItemization = false;
			wrapper1.show();
			wrapper2.hide();
			resetTable();
		} else {
			isItemization = true;
			wrapper2.show();
			wrapper1.hide();
			resetTags();
		}
	}

	// ui event handlers and modifiers

	function addPrincipleChargeRow(event){
		console.log('addPrincipleChargeRow()');

		event.preventDefault();
		var template = $('#row-principle-charge').text();
		var target = table.find('tr.active').eq(1);
		var html = $(template);
		var input = html.find('input').eq(0);
		var money = html.find('input').eq(1);

		//insert into dom
		target.before(html);

		//setup money mask
		money.maskMoney(configMoneymask);
	}

	function addAdditionalChargeRow(event){
		console.log('addAdditionalChargeRow()');

		event.preventDefault();
		var template = $('#row-additional-charge').text();
		var rows = table.find('tr')
		var target = rows.eq(rows.length-1);
		var html = $(template);
		var input = html.find('input').eq(0);
		var money = html.find('input').eq(1);

		//insert into dom
		target.before(html);

		//setup money mask
		money.maskMoney(configMoneymask);
	}

	function delChargeRow(event){
		//console.log('delChargeRow()');
		event.preventDefault();
		var tr = $(event.target).closest('tr');
		var money = tr.find('input.money');
		var input = tr.find('input').eq(0);
		var money = tr.find('input').eq(1);

		//remove plugins
		money.maskMoney('destroy');

		tr.remove();

		onItemizationChange();
	}

	function resetTable (){
		table.find('input.money').val('0.00');
	}

	function resetTags() {
		console.log('resetTags()');
		select1.tagsinput('removeAll');
		select1.trigger('validate.field.prove');
	}

	function sumItemizationValues(){
		//console.log('sumItemizationValues()');
		var monies = table.find('.amount');
		var sum = 0;
		monies.each(function(){
			var money = $(this).val();
			var amount = parseFloat(money);
			sum = sum + amount;
		});
		return sum.toFixed(2);
	}

	function onItemizationChange(){
		var sum = sumItemizationValues();
		var summation = table.find('.summation');
		summation.val(sum);
	}


	function tagClass(item){
		var isValid = regex.test(item);
		return (isValid)? 'label label-default' : 'label label-danger';
	}

	function revalidate(event){
		//console.log('revalidate()', event.target.name);
		var input = $(event.target);
		input.trigger('validate.field.prove');
	}

	function toLowerCase(item){
		return item.toLowerCase();
	}


	//private function
	function eventRow(event, data){

		var input = $(event.target);
		var ts = new Date(event.timeStamp);
		var tr = $('<tr><td></td><td></td><td></td><td></td><td></td></tr>');
		var td = tr.find('td');
		td.eq(0).text(event.type);
		td.eq(1).text(event.namespace);
		td.eq(2).text(input.attr('name') || 'form');
		td.eq(3).text(data.state);
		td.eq(4).text(ts.toISOString());
		return tr;
	}

})();