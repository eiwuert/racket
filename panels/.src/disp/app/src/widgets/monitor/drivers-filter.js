var React = require('react'), ReactDOM = require('react-dom');
var _ = require('underscore');

function add(arr, val) {
	var i = arr.indexOf(val);
	if (i == -1) {
		arr.push(val);
	}
	return arr;
}

function remove(arr, val) {
	var i = arr.indexOf(val);
	if (i != -1) {
		arr.splice(i, 1);
	}
	return arr;
}

class DriversFilter extends React.Component {
	constructor(props) {
		super(props);
		this.change = this.change.bind(this);
	}

	change(e) {
		var s = _.clone(this.props.state);
		var name = e.target.name;
		var on = e.target.checked;

		if (name == 'term') {
			s.term = on;
			this.props.onChange(s);
			return;
		}

		var id = parseInt(e.target.value);
		if (on) {
			s[name] = add(s[name], id);
		} else {
			s[name] = remove(s[name], id);
		}
		this.props.onChange(s);
	}

	render() {
		var s = this.props.state;
		var t = this;

		return (<div id="cars-selector">
			<b>Выбор водителей</b>
			<span>
				<label><input
					type="checkbox" name="term"
					checked={s.term}
					onChange={t.change}/> терминал</label>
			</span>
			<span>
			{
				disp.driverTypes().map(function(type, i) {
					var checked = s.types.indexOf(type.type_id) != -1;

					return (<label key={i}><input
						type="checkbox" name="types"
						value={type.type_id}
						checked={checked}
						onChange={t.change}/> {type.name}</label>);
				})
			}
			</span>
			<span>
			{
				disp.driverGroups().map(function(group, i) {
					var checked = s.groups.indexOf(group.group_id) != -1;
					return <label key={i}><input
						type="checkbox"
						name="groups"
						value={group.group_id}
						checked={checked}
						onChange={t.change}
						/> {group.name}</label>;
				})
			}
			</span>
		</div>);
	}
};

export default function DriversFilterWidget(disp)
{
	var s = {
		term: false,
		types: [],
		groups: []
	};

	var root = document.createElement('div');
	this.root = function() {
		return root;
	};

	var listeners = [];
	this.onChange = listeners.push.bind(listeners);

	function r() {
		ReactDOM.render(<DriversFilter state={s} onChange={onChange}/>, root);
	}
	r();

	function onChange(newState) {
		s = newState;
		r();

		var filter = [];
		if (s.term) {
			filter.push({has_bank_terminal: 1});
		}

		s.types.forEach(function(typeId) {
			filter.push({type_id: typeId});
		});

		s.groups.forEach(function(groupId) {
			filter.push({group_id: groupId});
		});

		listeners.forEach(function(f) {
			f(filter);
		});
	}

	this.clear = function() {
		s = {term: false, types: [], groups: []};
		r();
	};

}
