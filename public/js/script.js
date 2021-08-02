$(document).ready(function(){
	let dropZone = $('.upload-container');

	$(':file').focus(function() {
		$('label').addClass('focus');
	})
	.focusout(function() {
		$('label').removeClass('focus');
	});

	dropZone.on('drag dragstart dragend dragover dragenter dragleave drop', function(){
		return false;
	});

	dropZone.on('dragover dragenter', function() {
		dropZone.addClass('dragover');
	});

	dropZone.on('dragleave', function(e) {
		let dx = e.pageX - dropZone.offset().left;
		let dy = e.pageY - dropZone.offset().top;
		if ((dx < 0) || (dx > dropZone.width()) || (dy < 0) || (dy > dropZone.height())) {
			dropZone.removeClass('dragover');
		}
	});

	dropZone.on('drop', function(e) {
		dropZone.removeClass('dragover');
		let files = e.originalEvent.dataTransfer.files;
		let sender=$(this).attr('id')=="file-upload-container"?'file-input':'files-input';
		if  (sender=='file-input' && files.length>1) {
			alert("Можно добавить только один файл!")
			return;
		}
		sendFiles(files,sender);
	});

	$(':file').change(function() {
		let sender=$(this).attr('id');
		let files = this.files;
		sendFiles(files,sender);
	});


	function sendFiles(files,sender) {
		let Data = new FormData();
		$(files).each(function(index, file) {
			Data.append('images[]', file);
		});
		$.ajax({
			url: dropZone.attr('action'),
			type: dropZone.attr('method'),
			data: Data,
			contentType: false,
			processData: false,
			success: async function(data) {
				if (data.done && data.file.length>0) {
						$('#files-block').attr('style','display:block');
						let html='';
						for (let arr of data.file)
						{
							html+=`<tr align="right"><td class="first">${arr.path}</td><td align="right" ><a href="./uploads/${arr.filename}" download="${arr.originalname}">${arr.originalname}</a></td><td width="1" align="left"></td><td width="26"><button class='removeConditionBtn' name='removeConditionBtn'><i class="fa fa-close fa-fw fa-lg"></i></button></td></tr>`;
						}
						if (sender=="files-input"){
							$('#files-block').attr('style','display:block');
							$("#files-table").append(html);
							$("#files-table tr").find("td:eq(2)").html(";");
							$("#files-table tr").last().find('td:eq(2)').html("");
						} else {
							let fname = $("#file-table tr").last().find('td:eq(0)').text();
							if (fname!=""){
								let deleteResult = await DeleteFile(fname);
								if (!deleteResult.done){
									alert('Ошибка удаления файла!');
									for(let arr of deleteResult.error){
										console.error(arr.msg,": ", arr.err);
									}
									return;
								}
							}
							$('#file-block').attr('style','display:block');
							$("#file-table").html(html);

						}
				} else {
						alert("Ошибка загрузки файла!");
						for(let arr of data.error){
							console.error(arr.msg,": ", arr.err);
						}
				}
			}
		});

	}

	$("table").on("click", ".removeConditionBtn", async function() {
		let fname = $(this).closest('tr').find('td:eq(0)').text();
		let deleteResult=await DeleteFile(fname);

		if (deleteResult.done){
			$(this).closest("tr").remove();
			if ($("table").attr('id')=="files-table"){
				$("#files-table tr").find("td:eq(2)").html(";");
				$("#files-table tr").last().find('td:eq(2)').html("");
			}
		}
		else{
			alert('Ошибка удаления файла!');
			for(let arr of deleteResult.error){
				console.error(arr.msg,": ", arr.err);
			}
		}
	});
});


async function DeleteFile(fname,rez){
	rez=await $.post('/delete_file',{fname:fname},function(data){
	});
return rez
}
