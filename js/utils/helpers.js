/**
 * Funciones utilitarias compartidas por todos los módulos de cálculo.
 * Este archivo centraliza las funciones que antes estaban duplicadas
 * en cada archivo de dominio (familia, inmobiliario, mercantil, etc.).
 *
 * Requiere: vendor/NumberFormat150.js cargado previamente.
 */

function convertir(num) {
	var t = num.toString();
	t = strReplace(t, '.', ',');

	var nf = new NumberFormat(t);
	nf.setPlaces(2);
	nf.setCurrency(false);
	nf.setSeparators(true, nf.PERIOD, nf.COMMA);
	return nf.toFormatted();
}

function strReplace(s, r, w) {
	return s.split(r).join(w);
}

function in_array(needle, haystack) {
	var length = haystack.length;
	for (var i = 0; i < length; i++) {
		if (haystack[i] == needle) return true;
	}
	return false;
}

function validar(t) {
	t.value = convertir(t);
}

function formatear_cifras_moneda(parametro) {
	result = '';
	if (parametro != '') {
		monto = Math.round(parametro * 100) / 100;
		monto = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(monto);
		result = monto;
	}
	return result;
}

function cifras_moneda(parametro) {
	monto = parseFloat($("#socio_" + parametro).val().replace(/\./g, '').replace(',', '.'));
	if (isNaN(monto)) {
		$("#socio_" + parametro).addClass('border border-danger alert_input');
		setTimeout(function () { $("#socio_" + parametro).removeClass('border border-danger alert_input'), $("#socio_" + parametro).val('') }, 1200);
		return false;
	}
	monto = formatear_cifras_moneda(monto);
	$("#socio_" + parametro).val(monto);
}

function formatear_cifras_porcent(parametro) {
	result = '';
	if (parametro != '') {
		monto = parametro.replace(/[^0-9,.]/g, '').replace(/,/g, '.');
		monto = parametro.replace(',', '.');
		monto = Math.floor(monto * 100) / 100 / 100;
		monto = new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(monto);
		result = monto;
	}
	return result;
}
